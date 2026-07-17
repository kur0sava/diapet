import React from 'react';
import { Image } from 'react-native';
import { PetFace } from './PetFace';
import type { PetSpecies } from '@storage/domain/types';

interface Props {
  photoUri?: string | null;
  species?: PetSpecies | null;
  /** Diameter of the surrounding avatar circle — sizes the photo to fill it */
  size: number;
  /** PetFace glyph size when there is no photo (default ~½ of size) */
  faceSize?: number;
  faceColor?: string;
}

/**
 * Pet avatar content: the owner's photo when set, otherwise the species
 * line-art face. Designed to sit inside the existing circular containers
 * (they center content; the photo fills the circle exactly).
 */
export function PetAvatar({ photoUri, species, size, faceSize, faceColor = '#FFFFFF' }: Props) {
  if (photoUri) {
    return (
      <Image
        source={{ uri: photoUri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  return <PetFace species={species} size={faceSize ?? Math.round(size / 2)} color={faceColor} />;
}
