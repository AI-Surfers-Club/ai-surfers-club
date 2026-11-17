import { AboutSkeleton } from '@/components/about/about-skeleton';

export default function AboutLoading() {
  return (
    <main className="main">
      <h1 className="visually-hidden">About Us</h1>
      <AboutSkeleton />
    </main>
  );
}
