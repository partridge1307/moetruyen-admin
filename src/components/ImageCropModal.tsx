'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTrigger,
} from '@/components/ui/AlertDialog';
import { buttonVariants } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { cn, dataUrlToBlob } from '@/lib/utils';
import { forwardRef, useEffect, useRef, useState } from 'react';
import type { Crop, PixelCrop } from 'react-image-crop';
import { ReactCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropModalProps {
  image: string;
  aspect: number;
  // eslint-disable-next-line no-unused-vars
  setImageCropped: (value: string) => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: aspect === 1 ? 100 : 75,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

function cropImage(image: HTMLImageElement, crop: PixelCrop) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = Math.floor(crop.width * scaleX);
  canvas.height = Math.floor(crop.height * scaleY);

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx?.translate(-cropX, -cropY);
  ctx?.translate(centerX, centerY);
  ctx?.translate(-centerX, -centerY);

  ctx?.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  );
  const res = canvas.toDataURL('image/png');
  canvas.remove();

  return res;
}

const ImageCropModal = forwardRef<HTMLButtonElement, ImageCropModalProps>(
  function ImageCropModal({ image, aspect, setImageCropped }, ref) {
    const [completeCrop, setCompleteCrop] = useState<PixelCrop>();
    const [crop, setCrop] = useState<Crop>({
      unit: 'px',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
    const imageRef = useRef<HTMLImageElement | null>(null);
    let mediaWidth = useRef<number>(0),
      mediaHeight = useRef<number>(0);
    const [slider, setSlider] = useState<boolean>(false);

    useEffect(() => {
      if (imageRef.current) {
        mediaWidth.current = imageRef.current.naturalWidth;
        mediaHeight.current = imageRef.current.naturalHeight;
        setSlider(true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aspect, imageRef.current]);

    function onDoneHandler() {
      if (
        completeCrop?.width &&
        completeCrop?.height &&
        imageRef.current &&
        image
      ) {
        const dataUrl = cropImage(imageRef.current, completeCrop);
        const blob = dataUrlToBlob(dataUrl);
        const url = URL.createObjectURL(blob);

        setImageCropped(url);
      }
    }

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
      const { height, width, clientWidth, clientHeight } = e.currentTarget;
      const centerCrop = centerAspectCrop(width, height, aspect);

      const xCrop = Math.round(clientWidth * (centerCrop.x / 100));
      const widthCrop = Math.round(clientWidth * (centerCrop.width / 100));
      const yCrop = Math.round(clientHeight * (centerCrop.y / 100));
      const heightCrop = Math.round(clientHeight * (centerCrop.height / 100));

      setCompleteCrop({
        unit: 'px',
        x: xCrop,
        width: widthCrop,
        y: yCrop,
        height: heightCrop,
      });
      setCrop(centerCrop);
    }

    return (
      <AlertDialog>
        <AlertDialogTrigger ref={ref} className="hidden">
          Cropper
        </AlertDialogTrigger>
        <AlertDialogContent>
          <div className="space-y-10">
            {!!image && (
              <div className="flex justify-center">
                <ReactCrop
                  locked
                  crop={crop}
                  onChange={(_, percentCrop) => {
                    setCrop(percentCrop);
                  }}
                  onComplete={(c) => setCompleteCrop(c)}
                  aspect={aspect}
                  circularCrop={aspect === 1}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imageRef}
                    src={image}
                    alt="Profile Banner"
                    onLoad={onImageLoad}
                    style={{
                      maxHeight: '70vh',
                    }}
                  />
                </ReactCrop>
              </div>
            )}

            {slider && mediaWidth.current !== 0 && mediaHeight.current !== 0 ? (
              <Slider
                defaultValue={[aspect === 1 ? 100 : 75]}
                min={aspect === 1 ? 25 : 50}
                max={aspect === 1 ? 100 : 100}
                step={1}
                onValueChange={(value) => {
                  if (imageRef.current) {
                    const { x, width, y, height } = centerCrop(
                      makeAspectCrop(
                        { unit: '%', width: value[0] },
                        aspect,
                        mediaWidth.current,
                        mediaHeight.current
                      ),
                      mediaWidth.current,
                      mediaHeight.current
                    );

                    const { clientWidth, clientHeight } = imageRef.current;
                    const xCrop = Math.round(clientWidth * (x / 100));
                    const widthCrop = Math.round(clientWidth * (width / 100));
                    const yCrop = Math.round(clientHeight * (y / 100));
                    const heightCrop = Math.round(
                      clientHeight * (height / 100)
                    );

                    setCompleteCrop({
                      unit: 'px',
                      x: xCrop,
                      width: widthCrop,
                      y: yCrop,
                      height: heightCrop,
                    });

                    setCrop(
                      centerCrop(
                        makeAspectCrop(
                          { unit: '%', width: value[0] },
                          aspect,
                          mediaWidth.current,
                          mediaHeight.current
                        ),
                        mediaWidth.current,
                        mediaHeight.current
                      )
                    );
                  }
                }}
              />
            ) : null}

            <div className="w-full flex items-center justify-end gap-6">
              <AlertDialogCancel
                className={cn(
                  buttonVariants({ variant: 'destructive' }),
                  'bg-red-600 w-20'
                )}
              >
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                className={cn(buttonVariants({ variant: 'default' }), 'w-20')}
                onClick={() => onDoneHandler()}
              >
                Xong
              </AlertDialogAction>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
);

export default ImageCropModal;
