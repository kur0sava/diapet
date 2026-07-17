import React from 'react';
import { Cat, Dog, PawPrint } from 'lucide-react-native';
import type { PetSpecies } from '@storage/domain/types';

interface Props {
  /** Falls back to a paw print when species is unknown */
  species?: PetSpecies | null;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: object;
}

/**
 * Semantic pet-face sprite: minimalist line-art in the same visual language
 * as the rest of the iconography (Lucide, stroke 1.75). Replaces the 🐱/🐶
 * emoji and the anonymous paw avatar (v2.6 design pass). If we ever draw
 * custom faces, swap the internals here — call sites stay unchanged.
 */
export function PetFace({ species, size = 24, color = '#000', strokeWidth = 1.75, style }: Props) {
  const Face = species === 'dog' ? Dog : species === 'cat' ? Cat : PawPrint;
  return <Face size={size} color={color} strokeWidth={strokeWidth} style={style} />;
}
