'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ClientForm from '@/app/components/ClientForm';
import axios, { AxiosError } from 'axios'

interface EditClientPageProps {
  params: {
    id: string
  }
}

const EditClientPage: React.FC<EditClientPageProps> = ({ params }) => {
  const { id } = params
  const router = useRouter()
  const [clientData, setClientData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientResponse, categoriesResponse, tagsResponse] = await Promise.all([
          axios.get(`/clients/${id}`),
          axios.get('/categories'),
          axios.get('/tags')
        ])
        setClientData(clientResponse.data)
        setCategories(categoriesResponse.data)
        setTags(tagsResponse.data)
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('予期せぬエラーが発生しました')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleSubmit = async (formData: any) => {
    try {
      await axios.put(`/clients/${id}`, formData)
      router.push(`/clients/${id}`)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || '取引先の更新に失敗しました。')
      } else {
        setError('予期せぬエラーが発生しました。')
      }
    }
  }

  const handleClose = () => {
    router.push(`/clients/${id}`)
  }

  if (loading) {
    return <div>読み込み中...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">クライアント情報編集</h1>
      <ClientForm
        client={clientData}
        onSubmit={handleSubmit}
        onClose={handleClose}
        categories={categories}
        tags={tags}
      />
    </div>
  )
}

export default EditClientPage
