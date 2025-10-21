import dynamic from "next/dynamic";

const DualCam = dynamic(
  () => import("@/components/DualCam/view").then((mod) => mod.default),
  {
    ssr: false,
  }
);

export default DualCam;
