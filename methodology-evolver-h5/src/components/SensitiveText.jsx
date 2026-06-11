import { useSensitivePrivacy } from '../hooks/useSensitivePrivacy'

export default function SensitiveText({ id, value, fallback = '点击查看', className = '', as = 'span' }) {
  const { isHidden, reveal } = useSensitivePrivacy()
  const Tag = as
  if (!value) return <Tag className={className}>{value}</Tag>
  if (isHidden(id)) {
    return (
      <Tag
        className={`sensitive-mask ${className}`}
        onClick={(e) => { e.stopPropagation(); reveal(id) }}
      >{fallback}</Tag>
    )
  }
  return <Tag className={className}>{value}</Tag>
}
