import Image from "next/image";

interface AuthImagePanelProps {
  src: string;
  alt: string;
}

export function AuthImagePanel({
  src,
  alt,
}: AuthImagePanelProps) {
  return (
    <div className="relative hidden min-h-[580px] lg:block">
      <div className="absolute inset-8 overflow-hidden rounded-xl">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          className="object-contain"
          sizes="(min-width: 1024px) 45vw, 0px"
        />
      </div>
    </div>
  );
}