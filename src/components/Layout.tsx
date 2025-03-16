import Head from 'next/head'
import Navigation from './Navigation.tsx'
import styles from '@/styles/Layout.module.css'

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

export default function Layout({ children, title = 'ChrisOC Photo' }: LayoutProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Professional photography portfolio by ChrisOC" />
      </Head>
      <Navigation />
      <main className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        © {new Date().getFullYear()} ChrisOC Photo. All rights reserved.
      </footer>
    </div>
  )
}
