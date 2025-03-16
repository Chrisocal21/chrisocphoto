import Layout from '@/components/Layout'
import { GALLERY_IMAGES } from '@/data/photos'
import Image from 'next/image'
import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'

// Product types and sizes
const PRODUCT_TYPES = ['Canvas Print', 'Wood Print', 'Metal Print', 'Photo Book', 'Framed Print'];
const SIZES = ['8x10"', '11x14"', '16x20"', '24x36"', '30x40"'];
const PRICE_RANGES = ['Under $50', '$50-$100', '$100-$200', '$200+'];

interface SizeOption {
  size: string;
  price: number;
  priceRange: string;
}

interface ProductTypeOption {
  type: string;
  basePrice: number;
}

interface Product {
  id: string;
  imageTitle: string;
  image: string;
  category: string;
  productTypeOptions: ProductTypeOption[];
  selectedProductTypeIndex: number;
  sizeOptions: SizeOption[];
  selectedSizeIndex: number;
}

interface FilterState {
  productType: string[];
  size: string[];
  priceRange: string[];
  category: string[];
}

// Get base price for a product type
const getBasePrice = (productType: string): number => {
  switch(productType) {
    case 'Canvas Print': return 85;
    case 'Wood Print': return 110;
    case 'Metal Print': return 130;
    case 'Photo Book': return 65;
    case 'Framed Print': return 95;
    default: return 85;
  }
};

// Generate master products from gallery images
const generateProducts = (): Product[] => {
  const products: Product[] = [];
  
  GALLERY_IMAGES.forEach(category => {
    category.images.forEach(image => {
      // Create product type options for this image
      const productTypeOptions = PRODUCT_TYPES.map(type => ({
        type,
        basePrice: getBasePrice(type)
      }));
      
      // Generate size options with prices based on the default product type
      const defaultProductType = productTypeOptions[0];
      const sizeOptions = SIZES.map(size => {
        // Adjust price by size
        const sizeIndex = SIZES.indexOf(size);
        const price = defaultProductType.basePrice + (sizeIndex * 25);
        
        return {
          size,
          price,
          priceRange: price < 50 ? 'Under $50' : price < 100 ? '$50-$100' : price < 200 ? '$100-$200' : '$200+'
        };
      });
      
      // Create a master product
      products.push({
        id: `${image.title.replace(/\s+/g, '-').toLowerCase()}`,
        imageTitle: image.title,
        image: image.url,
        category: category.category,
        productTypeOptions,
        selectedProductTypeIndex: 0,
        sizeOptions,
        selectedSizeIndex: 0
      });
    });
  });
  
  return products;
};

// Calculate price based on product type and size
const calculatePrice = (product: Product): number => {
  const productType = product.productTypeOptions[product.selectedProductTypeIndex];
  const sizeIndex = product.selectedSizeIndex;
  return productType.basePrice + (sizeIndex * 25);
};

// Update size options when product type changes
const updateSizeOptions = (product: Product): SizeOption[] => {
  const productType = product.productTypeOptions[product.selectedProductTypeIndex];
  
  return SIZES.map(size => {
    // Adjust price by size
    const sizeIndex = SIZES.indexOf(size);
    const price = productType.basePrice + (sizeIndex * 25);
    
    return {
      size,
      price,
      priceRange: price < 50 ? 'Under $50' : price < 100 ? '$50-$100' : price < 200 ? '$100-$200' : '$200+'
    };
  });
};

export default function Store() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    productType: [],
    size: [],
    priceRange: [],
    category: []
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalProductTypeIndex, setModalProductTypeIndex] = useState(0);
  const [modalSizeIndex, setModalSizeIndex] = useState(0);

  // Initialize products on component mount
  useEffect(() => {
    const allProducts = generateProducts();
    setProducts(allProducts);
    setFilteredProducts(allProducts);
    
    // Extract unique categories
    const uniqueCategories = Array.from(new Set(GALLERY_IMAGES.map(category => category.category)));
    setCategories(uniqueCategories);
    
    setIsLoading(false);
  }, []);

  // Handle product type selection
  const handleProductTypeSelect = (productId: string, typeIndex: number) => {
    setProducts(currentProducts => 
      currentProducts.map(product => {
        if (product.id === productId) {
          // Update product type and recalculate size options
          const updatedProduct = { 
            ...product, 
            selectedProductTypeIndex: typeIndex
          };
          updatedProduct.sizeOptions = updateSizeOptions(updatedProduct);
          return updatedProduct;
        }
        return product;
      })
    );
    
    setFilteredProducts(currentFiltered => 
      currentFiltered.map(product => {
        if (product.id === productId) {
          // Update product type and recalculate size options
          const updatedProduct = { 
            ...product, 
            selectedProductTypeIndex: typeIndex
          };
          updatedProduct.sizeOptions = updateSizeOptions(updatedProduct);
          return updatedProduct;
        }
        return product;
      })
    );
  };

  // Handle size selection for a product
  const handleSizeSelect = (productId: string, sizeIndex: number) => {
    // Update both products and filteredProducts to keep them in sync
    setProducts(currentProducts => 
      currentProducts.map(product => 
        product.id === productId 
          ? { ...product, selectedSizeIndex: sizeIndex } 
          : product
      )
    );
    
    setFilteredProducts(currentFiltered => 
      currentFiltered.map(product => 
        product.id === productId 
          ? { ...product, selectedSizeIndex: sizeIndex } 
          : product
      )
    );
  };

  // Apply filters when activeFilters changes
  useEffect(() => {
    if (products.length === 0) return;
    
    const filtered = products.filter(product => {
      // Get current product type
      const currentProductType = product.productTypeOptions[product.selectedProductTypeIndex].type;
      
      // Check if product matches product type filter
      const matchesProductType = activeFilters.productType.length === 0 || 
                                activeFilters.productType.includes(currentProductType);
      
      // Check if product matches category filter
      const matchesCategory = activeFilters.category.length === 0 || 
                             activeFilters.category.includes(product.category);
      
      // Get current size and price
      const currentSize = product.sizeOptions[product.selectedSizeIndex];
      
      // Check if product matches size filter
      const matchesSize = activeFilters.size.length === 0 || 
                         activeFilters.size.includes(currentSize.size);
      
      // Check if product matches price range filter
      const matchesPriceRange = activeFilters.priceRange.length === 0 || 
                               activeFilters.priceRange.includes(currentSize.priceRange);
      
      return matchesProductType && matchesCategory && matchesSize && matchesPriceRange;
    });
    
    setFilteredProducts(filtered);
  }, [activeFilters, products]);

  // Handle filter change
  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setActiveFilters(prev => {
      const currentValues = [...prev[filterType]];
      const valueIndex = currentValues.indexOf(value);
      
      if (valueIndex === -1) {
        // Add new filter
        return { ...prev, [filterType]: [...currentValues, value] };
      } else {
        // Remove existing filter
        currentValues.splice(valueIndex, 1);
        return { ...prev, [filterType]: currentValues };
      }
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({
      productType: [],
      size: [],
      priceRange: [],
      category: []
    });
  };

  // Handle filter sidebar toggle for mobile
  const toggleFiltersMobile = () => {
    setShowFiltersMobile(!showFiltersMobile);
  };

  // Open modal with product
  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setModalProductTypeIndex(product.selectedProductTypeIndex);
    setModalSizeIndex(product.selectedSizeIndex);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };
  
  // Add to cart from modal
  const addToCart = () => {
    if (!selectedProduct) return;
    
    // Create a copy of the selected product with the modal selections
    const productToAdd = {
      ...selectedProduct,
      selectedProductTypeIndex: modalProductTypeIndex,
      selectedSizeIndex: modalSizeIndex
    };
    
    // Here you would add the product to the cart (future implementation)
    console.log('Added to cart:', productToAdd);
    
    // Close modal
    closeModal();
    
    // Optional: Show a confirmation message
    alert('Product added to cart!');
  };
  
  // Get min price for a product
  const getMinPrice = (product: Product): number => {
    const productType = product.productTypeOptions[0]; // Get cheapest product type
    return productType.basePrice;
  }

  return (
    <Layout title="Store - ChrisOC Photo">
      <div className="pt-16 sm:pt-20 px-6 sm:px-8 md:px-10 lg:px-12 max-w-[1800px] mx-auto">
        <div className="glass-card p-4 sm:p-6 rounded-2xl mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Print Store</h1>
          <p className="text-base sm:text-lg mb-2">Transform your space with stunning photography prints</p>
        </div>
        
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <button 
            onClick={toggleFiltersMobile}
            className="w-full flex items-center justify-between glass-card p-4 rounded-xl text-left"
          >
            <span className="font-medium">Filters {Object.values(activeFilters).some(arr => arr.length > 0) && 
              `(${Object.values(activeFilters).flat().length})`}</span>
            <span>{showFiltersMobile ? "↑" : "↓"}</span>
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          {/* Filter sidebar - make it more compact */}
          <div className={`${showFiltersMobile ? 'block' : 'hidden'} lg:block lg:w-1/5 glass-card p-3 sm:p-4 rounded-xl h-fit`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Filters</h2>
              {Object.values(activeFilters).some(arr => arr.length > 0) && (
                <button 
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              )}
            </div>
            
            {/* Product Type Filter */}
            <div className="mb-5">
              <h3 className="font-medium mb-2 pb-1 border-b border-gray-200">Product Type</h3>
              <div className="space-y-2">
                {PRODUCT_TYPES.map(type => (
                  <div key={type} className="flex items-center">
                    <input
                      id={`type-${type}`}
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                      checked={activeFilters.productType.includes(type)}
                      onChange={() => handleFilterChange('productType', type)}
                    />
                    <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-700">
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Size Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2 pb-1 border-b border-gray-200">Size</h3>
              <div className="space-y-2">
                {SIZES.map(size => (
                  <div key={size} className="flex items-center">
                    <input
                      id={`size-${size}`}
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                      checked={activeFilters.size.includes(size)}
                      onChange={() => handleFilterChange('size', size)}
                    />
                    <label htmlFor={`size-${size}`} className="ml-2 text-sm text-gray-700">
                      {size}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Price Range Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2 pb-1 border-b border-gray-200">Price Range</h3>
              <div className="space-y-2">
                {PRICE_RANGES.map(range => (
                  <div key={range} className="flex items-center">
                    <input
                      id={`price-${range}`}
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                      checked={activeFilters.priceRange.includes(range)}
                      onChange={() => handleFilterChange('priceRange', range)}
                    />
                    <label htmlFor={`price-${range}`} className="ml-2 text-sm text-gray-700">
                      {range}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2 pb-1 border-b border-gray-200">Collection</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category} className="flex items-center">
                    <input
                      id={`cat-${category}`}
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                      checked={activeFilters.category.includes(category)}
                      onChange={() => handleFilterChange('category', category)}
                    />
                    <label htmlFor={`cat-${category}`} className="ml-2 text-sm text-gray-700">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Product Grid - expand to use more horizontal space */}
          <div className="lg:w-4/5">
            {isLoading ? (
              <div className="text-center py-10">Loading products...</div>
            ) : filteredProducts.length > 0 ? (
              <>
                <p className="mb-3 text-sm text-gray-600">{filteredProducts.length} products found</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                  {filteredProducts.map(product => {
                    return (
                      <div key={product.id} className="glass-card rounded-xl overflow-hidden neo-card hover:shadow-lg transition-all h-full flex flex-col">
                        <div className="relative aspect-square w-full overflow-hidden">
                          <Image
                            src={product.image}
                            alt={product.imageTitle}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                            style={{ objectFit: 'cover' }}
                            className="transition-all hover:scale-105 duration-500"
                            priority={true}
                          />
                        </div>
                        <div className="p-3 sm:p-4 flex flex-col flex-grow">
                          <h3 className="font-medium truncate text-base sm:text-lg">{product.imageTitle}</h3>
                          <div className="flex justify-between items-center mt-2 mb-auto">
                            <span className="text-sm text-gray-600">Starting at</span>
                            <span className="font-medium">${getMinPrice(product)}</span>
                          </div>
                          <div className="mt-3">
                            <button 
                              onClick={() => openProductModal(product)}
                              className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-md transition-colors text-sm"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-10 glass-card rounded-xl">
                <h3 className="text-lg font-medium">No products match your filters</h3>
                <p className="mt-2 text-gray-600">Try adjusting or clearing your filters</p>
                <button 
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Product Options Modal */}
        <Transition appear show={isModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={closeModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl glass-card p-6 text-left align-middle shadow-xl transition-all">
                    {selectedProduct && (
                      <>
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium leading-6 mb-4 border-b pb-2"
                        >
                          Customize Your Order
                        </Dialog.Title>
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Product Image */}
                          <div className="md:w-2/5">
                            <div className="relative aspect-square overflow-hidden rounded-lg">
                              <Image
                                src={selectedProduct.image}
                                alt={selectedProduct.imageTitle}
                                fill
                                sizes="(max-width: 768px) 100vw, 384px"
                                style={{ objectFit: 'cover' }}
                                className={`transition-all ${
                                  selectedProduct.productTypeOptions[modalProductTypeIndex].type === 'Metal Print' ? 'brightness-110 contrast-105' : 
                                  selectedProduct.productTypeOptions[modalProductTypeIndex].type === 'Canvas Print' ? 'brightness-95 contrast-105' :
                                  selectedProduct.productTypeOptions[modalProductTypeIndex].type === 'Wood Print' ? 'brightness-90 sepia-[0.15]' : ''
                                }`}
                              />
                              
                              {/* Overlay effects based on selected product type */}
                              {selectedProduct.productTypeOptions[modalProductTypeIndex].type === 'Framed Print' && (
                                <div className="absolute inset-0 border-[12px] border-white/80 shadow-inner"></div>
                              )}
                              {selectedProduct.productTypeOptions[modalProductTypeIndex].type === 'Canvas Print' && (
                                <div className="absolute inset-0 shadow-inner border border-black/10"></div>
                              )}
                              {selectedProduct.productTypeOptions[modalProductTypeIndex].type === 'Wood Print' && (
                                <div className="absolute inset-0 bg-gradient-to-t from-[#d6b588]/30 to-[#d6b588]/10 mix-blend-multiply"></div>
                              )}
                              {selectedProduct.productTypeOptions[modalProductTypeIndex].type === 'Metal Print' && (
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/10 mix-blend-overlay"></div>
                              )}
                            </div>
                            <h3 className="mt-2 font-medium">{selectedProduct.imageTitle}</h3>
                          </div>
                          
                          {/* Product Options */}
                          <div className="md:w-3/5">
                            {/* Product Type Selection */}
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Select Style:</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedProduct.productTypeOptions.map((option, idx) => (
                                  <button
                                    key={option.type}
                                    onClick={() => setModalProductTypeIndex(idx)}
                                    className={`px-3 py-2 rounded-md border ${
                                      idx === modalProductTypeIndex
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                    }`}
                                  >
                                    {option.type}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            {/* Size Selection */}
                            <div className="mb-6">
                              <h4 className="font-medium mb-2">Select Size:</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedProduct.sizeOptions.map((option, idx) => (
                                  <button
                                    key={option.size}
                                    onClick={() => setModalSizeIndex(idx)}
                                    className={`px-3 py-2 rounded-md border ${
                                      idx === modalSizeIndex
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                    }`}
                                  >
                                    {option.size}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            {/* Price and Add to Cart */}
                            <div className="mt-6 pt-4 border-t">
                              <div className="flex justify-between items-center mb-4">
                                <span className="text-lg font-medium">Total:</span>
                                <span className="text-xl font-bold">
                                  ${selectedProduct.productTypeOptions[modalProductTypeIndex].basePrice + (modalSizeIndex * 25)}
                                </span>
                              </div>
                              
                              <div className="flex gap-4">
                                <button
                                  type="button"
                                  className="flex-1 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                  onClick={closeModal}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                  onClick={addToCart}
                                >
                                  Add to Cart
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </Layout>
  )
}
