import { BaseCard, GroupLikeCard } from "@/lib/cards"
import CardDisplay from "./card-display"
import { Button } from "./ui/button"

interface CardPreviewModalProps {
  card: BaseCard
  onClose: () => void
  actionLabel?: string
  onAction?: () => void
}

const isGroupLikeCard = (card: BaseCard): card is GroupLikeCard =>
  card.type === "Group" ||
  card.type === "Resource" ||
  card.type === "Place" ||
  card.type === "Personality" ||
  card.type === "Organization" ||
  card.type === "Artifact"

export default function CardPreviewModal({ card, onClose, actionLabel, onAction }: CardPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="modal-zoom relative z-10 w-full max-w-4xl rounded-3xl border border-white/10 bg-gradient-to-br from-gray-950 via-gray-900 to-black p-8 text-white shadow-[0_25px_80px_rgba(0,0,0,0.65)]">
        <button
          className="absolute right-6 top-6 text-gray-400 hover:text-white transition-colors cursor-pointer"
          onClick={onClose}
          aria-label="Close preview"
        >
          ✕
        </button>
        <div className="grid gap-8 md:grid-cols-[360px,1fr] items-center">
          <div className="flex justify-center">
            <CardDisplay card={card} size="xlarge" imageFit="contain" className="scale-105" />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[#FF324A]/80 mb-3">Physical Card</p>
              <p className="text-sm text-gray-300 leading-relaxed">{card.description}</p>
            </div>
            {isGroupLikeCard(card) && card.alignments && card.alignments.length > 0 ? (
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">Alignments</p>
                <div className="flex flex-wrap gap-2">
                  {card.alignments.map((alignment) => (
                    <span
                      key={`${card.id}-${alignment}`}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide"
                    >
                      {alignment}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {isGroupLikeCard(card) && (
              <div className="flex gap-4 text-sm font-mono text-white">
                <span className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                  PWR: <span className="font-semibold">{card.power}</span>
                </span>
                {typeof card.resistance === "number" && (
                  <span className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                    RES: <span className="font-semibold">{card.resistance}</span>
                  </span>
                )}
                <span className="flex-1 rounded-lg border border-violet-500/30 bg-violet-900/20 px-4 py-2">
                  COST: <span className="font-semibold text-violet-300">{card.powerCost}</span>
                </span>
              </div>
            )}
            <div className="flex flex-col gap-3 pt-4 md:flex-row">
              {actionLabel && onAction && (
                <Button
                  className="w-full md:flex-1 rounded-2xl bg-gradient-to-r from-[#FF324A] via-[#FF5F1F] to-[#FFBA56] text-black font-semibold tracking-[0.2em] uppercase hover:shadow-lg hover:shadow-[#FF324A]/30 transition-all duration-300 cursor-pointer"
                  onClick={onAction}
                >
                  {actionLabel}
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full md:flex-1 rounded-2xl border-white/30 bg-black/30 text-white font-semibold tracking-[0.2em] uppercase transition-all duration-300 hover:border-[#FFBA56] hover:bg-[radial-gradient(circle_at_top,_rgba(255,186,86,0.2),_transparent_65%)] hover:text-[#FFBA56] hover:shadow-[0_12px_35px_rgba(255,186,86,0.35)] cursor-pointer"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes previewZoom {
          0% {
            transform: scale(0.9) translateY(10px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .modal-zoom {
          animation: previewZoom 0.35s ease forwards;
        }
      `}</style>
    </div>
  )
}
