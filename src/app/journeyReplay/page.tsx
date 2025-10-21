import dynamicImport from 'next/dynamic';

// Force dynamic rendering to avoid SSR issues with Leaflet
export const dynamic = 'force-dynamic';

const journeyReplay = dynamicImport(() => import('@/components/JourneyReplay/journeyreplay').then((mod) => mod.default), {
  ssr: false,
});

export default journeyReplay;