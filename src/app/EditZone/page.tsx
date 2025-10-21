import dynamicImport from 'next/dynamic';

// Force dynamic rendering to avoid SSR issues with Leaflet
export const dynamic = 'force-dynamic';

const EditZone = dynamicImport(() => import('@/components/zone/editzonecomp').then((mod) => mod.default), {
  ssr: false,
});

export default EditZone;