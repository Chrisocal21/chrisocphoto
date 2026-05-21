export type Exif = {
  dateTaken: string;     // e.g. "2024-03-15T14:32:07"
  lat: number;
  lng: number;
  camera: string;        // e.g. "Apple iPhone 15 Pro"
  lens?: string;         // e.g. "iPhone 15 Pro back triple camera 6.765mm f/2.8"
  aperture?: string;     // e.g. "f/2.8"
  shutter?: string;      // e.g. "1/1200s"
  iso?: number;
  focalLength?: string;  // e.g. "77mm (eq.)"
};

export type Photo = {
  id: string;
  url: string;
  thumbUrl: string;
  date: string;
  caption?: string;
  status?: 'draft' | 'published';
  exif?: Exif;
};

export type Location = {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
  photos: Photo[];
};

function photo(seed: string, date: string, exif?: Exif): Photo {
  return {
    id: seed,
    url: `https://picsum.photos/seed/${seed}/1400/933`,
    thumbUrl: `https://picsum.photos/seed/${seed}/600/400`,
    date,
    exif,
  };
}

export const MOCK_LOCATIONS: Location[] = [
  {
    id: 'san-diego',
    name: 'San Diego, CA',
    lat: 32.7157,
    lng: -117.1611,
    photos: [
      photo('sd1', 'Mar 15, 2024', { dateTaken: '2024-03-15T14:32:07', lat: 32.7157, lng: -117.1611, camera: 'Apple iPhone 15 Pro', lens: 'Triple camera 6.765mm', aperture: 'f/2.8', shutter: '1/1200s', iso: 50, focalLength: '77mm eq.' }),
      photo('sd2', 'Mar 14, 2024', { dateTaken: '2024-03-14T09:18:44', lat: 32.7096, lng: -117.1573, camera: 'Apple iPhone 15 Pro', aperture: 'f/1.78', shutter: '1/500s', iso: 32, focalLength: '24mm eq.' }),
      photo('sd3', 'Feb 20, 2024', { dateTaken: '2024-02-20T17:05:22', lat: 32.7223, lng: -117.1688, camera: 'Apple iPhone 15 Pro', aperture: 'f/2.8', shutter: '1/60s', iso: 400, focalLength: '77mm eq.' }),
    ],
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles, CA',
    lat: 34.0522,
    lng: -118.2437,
    photos: [
      photo('la1', 'Jan 8, 2024', { dateTaken: '2024-01-08T11:45:33', lat: 34.0522, lng: -118.2437, camera: 'Apple iPhone 15 Pro', aperture: 'f/1.78', shutter: '1/800s', iso: 50, focalLength: '24mm eq.' }),
      photo('la2', 'Jan 7, 2024', { dateTaken: '2024-01-07T19:22:11', lat: 34.0195, lng: -118.4912, camera: 'Apple iPhone 15 Pro', aperture: 'f/2.8', shutter: '1/30s', iso: 800, focalLength: '77mm eq.' }),
    ],
  },
  {
    id: 'big-sur',
    name: 'Big Sur, CA',
    lat: 36.2704,
    lng: -121.8081,
    photos: [
      photo('bs1', 'Oct 3, 2023', { dateTaken: '2023-10-03T07:14:02', lat: 36.2704, lng: -121.8081, camera: 'Apple iPhone 14 Pro', aperture: 'f/1.78', shutter: '1/2000s', iso: 32, focalLength: '24mm eq.' }),
      photo('bs2', 'Oct 3, 2023', { dateTaken: '2023-10-03T08:47:19', lat: 36.2651, lng: -121.8022, camera: 'Apple iPhone 14 Pro', aperture: 'f/2.8', shutter: '1/600s', iso: 50, focalLength: '77mm eq.' }),
      photo('bs3', 'Oct 2, 2023', { dateTaken: '2023-10-02T16:38:55', lat: 36.2801, lng: -121.8143, camera: 'Apple iPhone 14 Pro', aperture: 'f/1.78', shutter: '1/400s', iso: 64, focalLength: '24mm eq.' }),
      photo('bs4', 'Oct 2, 2023', { dateTaken: '2023-10-02T18:01:30', lat: 36.2750, lng: -121.8100, camera: 'Apple iPhone 14 Pro', aperture: 'f/1.78', shutter: '1/125s', iso: 200, focalLength: '24mm eq.' }),
    ],
  },
  {
    id: 'san-francisco',
    name: 'San Francisco, CA',
    lat: 37.7749,
    lng: -122.4194,
    photos: [
      photo('sf1', 'Sep 12, 2023', { dateTaken: '2023-09-12T13:22:08', lat: 37.7749, lng: -122.4194, camera: 'Apple iPhone 14 Pro', aperture: 'f/1.78', shutter: '1/1000s', iso: 50, focalLength: '24mm eq.' }),
      photo('sf2', 'Sep 11, 2023', { dateTaken: '2023-09-11T10:05:44', lat: 37.8024, lng: -122.4058, camera: 'Apple iPhone 14 Pro', aperture: 'f/2.8', shutter: '1/750s', iso: 50, focalLength: '77mm eq.' }),
      photo('sf3', 'Sep 10, 2023'),
    ],
  },
  {
    id: 'portland',
    name: 'Portland, OR',
    lat: 45.5051,
    lng: -122.675,
    photos: [
      photo('por1', 'Aug 19, 2023'),
      photo('por2', 'Aug 18, 2023'),
    ],
  },
  {
    id: 'olympic-np',
    name: 'Olympic NP, WA',
    lat: 47.9026,
    lng: -123.4989,
    photos: [
      photo('olym1', 'Jul 4, 2023'),
      photo('olym2', 'Jul 4, 2023'),
      photo('olym3', 'Jul 3, 2023'),
    ],
  },
  {
    id: 'seattle',
    name: 'Seattle, WA',
    lat: 47.6062,
    lng: -122.3321,
    photos: [
      photo('sea1', 'Jul 2, 2023'),
      photo('sea2', 'Jul 1, 2023'),
    ],
  },
  {
    id: 'glacier',
    name: 'Glacier NP, MT',
    lat: 48.6968,
    lng: -113.7185,
    photos: [
      photo('glac1', 'Jun 22, 2023'),
      photo('glac2', 'Jun 22, 2023'),
      photo('glac3', 'Jun 21, 2023'),
      photo('glac4', 'Jun 20, 2023'),
    ],
  },
  {
    id: 'yellowstone',
    name: 'Yellowstone, WY',
    lat: 44.428,
    lng: -110.5885,
    photos: [
      photo('yst1', 'Jun 10, 2023'),
      photo('yst2', 'Jun 10, 2023'),
      photo('yst3', 'Jun 9, 2023'),
      photo('yst4', 'Jun 9, 2023'),
      photo('yst5', 'Jun 8, 2023'),
    ],
  },
  {
    id: 'grand-teton',
    name: 'Grand Teton, WY',
    lat: 43.7904,
    lng: -110.6818,
    photos: [
      photo('gt1', 'Jun 7, 2023'),
      photo('gt2', 'Jun 6, 2023'),
      photo('gt3', 'Jun 5, 2023'),
    ],
  },
  {
    id: 'arches',
    name: 'Arches NP, UT',
    lat: 38.7331,
    lng: -109.5925,
    photos: [
      photo('arch1', 'May 14, 2023'),
      photo('arch2', 'May 14, 2023'),
      photo('arch3', 'May 13, 2023'),
      photo('arch4', 'May 12, 2023'),
    ],
  },
  {
    id: 'grand-canyon',
    name: 'Grand Canyon, AZ',
    lat: 36.1069,
    lng: -112.1129,
    photos: [
      photo('gc1', 'Apr 28, 2023'),
      photo('gc2', 'Apr 27, 2023'),
      photo('gc3', 'Apr 26, 2023'),
    ],
  },
  {
    id: 'denver',
    name: 'Denver, CO',
    lat: 39.7392,
    lng: -104.9903,
    photos: [
      photo('den1', 'Apr 5, 2023'),
    ],
  },
  {
    id: 'santa-fe',
    name: 'Santa Fe, NM',
    lat: 35.687,
    lng: -105.9378,
    photos: [
      photo('sf_nm1', 'Mar 18, 2023'),
      photo('sf_nm2', 'Mar 17, 2023'),
    ],
  },
  {
    id: 'austin',
    name: 'Austin, TX',
    lat: 30.2672,
    lng: -97.7431,
    photos: [
      photo('atx1', 'Feb 10, 2023'),
      photo('atx2', 'Feb 9, 2023'),
    ],
  },
  {
    id: 'new-orleans',
    name: 'New Orleans, LA',
    lat: 29.9511,
    lng: -90.0715,
    photos: [
      photo('nola1', 'Jan 22, 2023'),
      photo('nola2', 'Jan 21, 2023'),
      photo('nola3', 'Jan 20, 2023'),
    ],
  },
  {
    id: 'nashville',
    name: 'Nashville, TN',
    lat: 36.1627,
    lng: -86.7816,
    photos: [
      photo('nash1', 'Dec 3, 2022'),
    ],
  },
  {
    id: 'savannah',
    name: 'Savannah, GA',
    lat: 32.0835,
    lng: -81.0998,
    photos: [
      photo('sav1', 'Nov 12, 2022'),
      photo('sav2', 'Nov 11, 2022'),
    ],
  },
  {
    id: 'miami',
    name: 'Miami, FL',
    lat: 25.7617,
    lng: -80.1918,
    photos: [
      photo('mia1', 'Oct 28, 2022'),
      photo('mia2', 'Oct 27, 2022'),
    ],
  },
  {
    id: 'chicago',
    name: 'Chicago, IL',
    lat: 41.8781,
    lng: -87.6298,
    photos: [
      photo('chi1', 'Sep 15, 2022'),
      photo('chi2', 'Sep 14, 2022'),
    ],
  },
  {
    id: 'new-york',
    name: 'New York, NY',
    lat: 40.7128,
    lng: -74.006,
    photos: [
      photo('nyc1', 'Aug 8, 2022'),
      photo('nyc2', 'Aug 7, 2022'),
      photo('nyc3', 'Aug 6, 2022'),
    ],
  },
];
