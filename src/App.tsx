import { useState, useEffect } from 'react'
import {
  Layout,
  Typography,
  Input,
  Button,
  List,
  Modal,
  Form,
  InputNumber,
  Tag,
  Space,
  Alert,
  Spin,
  Empty,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { api } from './api'
import type { Product } from './types/products'

const { Content } = Layout
const { Title, Text } = Typography

interface ProductFormData {
  title: string
  description: string
  price: number
  category: string
  stock: number
}

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showModal, setShowModal] = useState<boolean>(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getProducts(10)
      setProducts(data.docs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchProducts()
      return
    }

    try {
      setLoading(true)
      const data = await api.searchProducts(searchQuery)
      setProducts(data.docs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Qidirishda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    form.resetFields()
    setShowModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    form.setFieldsValue({
      title: product.title,
      description: product.description || '',
      price: product.price,
      category: product.category || '',
      stock: product.stock || 0,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
    form.resetFields()
  }

  const handleSubmit = async (values: ProductFormData) => {
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, values)
        Modal.success({ content: '✅ Mahsulot yangilandi!' })
      } else {
        await api.createProduct(values)
        Modal.success({ content: '✅ Mahsulot qo\'shildi!' })
      }
      
      closeModal()
      fetchProducts()
    } catch (err) {
      Modal.error({ 
        content: '❌ Xatolik: ' + (err instanceof Error ? err.message : 'Noma\'lum xatolik')
      })
    }
  }

  const handleDelete = async (id: string, title: string) => {
    Modal.confirm({
      title: 'O\'chirish',
      content: `"${title}" mahsulotini o'chirmoqchimisiz?`,
      okText: 'Ha',
      cancelText: 'Yo\'q',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.deleteProduct(id)
          Modal.success({ content: '✅ Mahsulot o\'chirildi!' })
          fetchProducts()
        } catch (err) {
          Modal.error({ content: ' O\'chirishda xatolik' })
        }
      }
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m'
  }

  if (loading && products.length === 0) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" tip="Yuklanmoqda..." />
      </Layout>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
     
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <img 
              src="https://cdn1.iconfinder.com/data/icons/shopping-and-commerce-round/128/18-512.png" 
              alt="Shopping icon"
              style={{ width: 40, height: 40 }}
            />
            Mahsulotlar
          </Title>
          <Text type="secondary">Jami {products.length} ta mahsulot</Text>
        </div>

     
        <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 24 }}>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
              aria-label="Mahsulot qidirish"
              suffix={
                searchQuery && (
                  <CloseCircleOutlined
                    onClick={() => {
                      setSearchQuery('')
                      fetchProducts()
                    }}
                    style={{ cursor: 'pointer', color: '#999' }}
                    aria-label="Qidiruvni tozalash"
                  />
                )
              }
            />
            <Button type="primary" onClick={handleSearch}>
              Qidirish
            </Button>
          </Space.Compact>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            style={{ width: 'auto' }}
          >
            Yangi mahsulot
          </Button>
        </Space>

     
        {error && (
          <Alert
            message={error}
            type="error"
            closable
            style={{ marginBottom: 24 }}
            action={
              <Button size="small" onClick={fetchProducts}>
                Qayta urinish
              </Button>
            }
          />
        )}

        {products.length === 0 ? (
          <Empty
            description="Mahsulot topilmadi"
            style={{ 
              background: 'white', 
              padding: 48, 
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Mahsulot qo'shish
            </Button>
          </Empty>
        ) : (
          <List
            dataSource={products}
            renderItem={(product) => (
              <List.Item
                style={{
                  background: 'white',
                  marginBottom: 8,
                  padding: '16px',
                  borderRadius: 8,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => openEditModal(product)}
                  />,
                  <Button
                    key="delete"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(product.id, product.title)}
                  />
                ]}
              >
                <List.Item.Meta
                  title={<Text strong>{product.title}</Text>}
                  description={
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      {product.description && (
                        <Text type="secondary" ellipsis>
                          {product.description}
                        </Text>
                      )}
                      <Space wrap>
                        {product.category && (
                          <Tag color="blue">{product.category}</Tag>
                        )}
                        <Tag>{formatPrice(product.price)}</Tag>
                        {product.stock !== undefined && (
                          <Tag color={product.stock > 0 ? 'success' : 'error'}>
                            {product.stock > 0 ? `${product.stock} ta` : 'Tugagan'}
                          </Tag>
                        )}
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}

    
        <Modal
          title={editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}
          open={showModal}
          onCancel={closeModal}
          footer={null}
          width={500}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              title: '',
              description: '',
              price: 0,
              category: '',
              stock: 0,
            }}
          >
            <Form.Item
              name="title"
              label="Mahsulot nomi"
              rules={[{ required: true, message: 'Mahsulot nomini kiriting!' }]}
            >
              <Input placeholder="Masalan: Olma" />
            </Form.Item>

            <Form.Item name="description" label="Tavsif">
              <Input.TextArea
                rows={3}
                placeholder="Mahsulot haqida qisqacha ma'lumot"
              />
            </Form.Item>

            <Space style={{ width: '100%' }} size="middle">
              <Form.Item
                name="price"
                label="Narxi (so'm)"
                rules={[{ required: true, message: 'Narxni kiriting!' }]}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="0"
                />
              </Form.Item>

            </Space>

            <Form.Item name="category" label="Kategoriya" style={{ marginTop: 16 }}>
              <Input placeholder="Masalan: meva, sabzavot" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={closeModal}>
                  Bekor qilish
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingProduct ? 'Saqlash' : 'Qo\'shish'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  )
}

export default App