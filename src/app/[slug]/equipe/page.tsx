'use client';

import React from 'react';
import { CheckClientView } from '@/components/boarding/BoardingView';

export default function EquipePage({ params }: { params: { slug: string } }) {
  return <CheckClientView params={params} readOnlyOverride={false} />;
}
