import dynamic from "next/dynamic";

const DualCam = dynamic(
  () => import("@/components/Command/view").then((mod) => mod.default),
  {
    ssr: false,
  }
);

export default DualCam;