import Image, { type StaticImageData } from "next/image";

import { cn } from "@/lib/cn";

type Props = {
  src: StaticImageData;
  alt: string;
  sizes: string;
  className?: string;
};

/**
 * The image mapped onto the brand ramp — ink shadows, flame mids, sunlight
 * highlights — fading to the original on hover (inside a `group`). Both layers
 * use the same file, so it downloads once. Works for any photo dropped in later.
 */
export function Duotone({ src, alt, sizes, className }: Props) {
  return (
    <div className={cn("relative", className)}>
      <svg aria-hidden="true" focusable="false" className="absolute size-0">
        <filter id="duotone-sun" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.051 0.992 1" />
            <feFuncG type="table" tableValues="0.039 0.365 0.847" />
            <feFuncB type="table" tableValues="0.031 0.086 0.29" />
          </feComponentTransfer>
        </filter>
      </svg>
      <Image src={src} alt={alt} sizes={sizes} placeholder="blur" className="w-full" />
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        sizes={sizes}
        className="absolute inset-0 size-full object-cover transition-opacity duration-700 ease-expo [filter:url(#duotone-sun)] group-hover:opacity-0"
      />
    </div>
  );
}
