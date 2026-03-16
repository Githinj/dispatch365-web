interface PageHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-white text-xl font-semibold">{title}</h1>
        {description && <p className="text-zinc-500 text-sm mt-0.5">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
