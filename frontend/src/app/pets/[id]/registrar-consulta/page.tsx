'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RegistrarConsultaRedirect() {
  const router = useRouter();
  const params = useParams();
  useEffect(() => {
    router.replace(`/pets/${params?.id}`);
  }, [router, params]);
  return null;
}
