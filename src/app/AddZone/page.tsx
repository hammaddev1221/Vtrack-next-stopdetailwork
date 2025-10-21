import dynamicImport from 'next/dynamic';

// Force dynamic rendering to avoid SSR issues with Leaflet
export const dynamic = 'force-dynamic';

const AddZone = dynamicImport(() => import('@/components/zone/addzonecomp').then((mod) => mod.default), {
  ssr: false,
});

export default AddZone;