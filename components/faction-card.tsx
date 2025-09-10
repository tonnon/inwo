type FactionCardProps = {
  imageUrl: string
  name: string
  description: string
}

export default function FactionCard({ imageUrl, name, description }: FactionCardProps) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-[#FF324A]/20 rounded-xl p-6 text-center transition-all duration-300 hover:border-[#FF324A] hover:shadow-lg hover:shadow-[#FF324A]/20 hover:-translate-y-2 group relative overflow-hidden cursor-pointer">
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF324A]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />

      <div className="relative w-full max-w-full mx-auto mb-4 flex items-center justify-center overflow-hidden rounded-md aspect-[8/5]">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={`${name} card`}
          width={200}
          height={125}
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>
      <h3 className="text-xl font-bold mb-3 text-[#FF324A] font-mono">{name}</h3>
      <p className="text-gray-400 leading-relaxed line-clamp-3">{description}</p>
    </div>
  )
}
