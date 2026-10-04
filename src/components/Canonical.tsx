import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/utils/site";

// Tells Google which address is the "real" one for a page. The same site answers on both
// ettiquette-cv.web.app and its firebaseapp.com twin, so without this Google may treat them as duplicates.
export function Canonical({ path }: { path: string }) {
  return (
    <Helmet>
      <link rel="canonical" href={`${SITE_URL}${path}`} />
    </Helmet>
  );
}
