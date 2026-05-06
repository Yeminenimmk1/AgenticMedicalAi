import * as Dialog from '@radix-ui/react-dialog'
import { Phone, AlertTriangle, Cross } from 'lucide-react'
import { Button } from './ui/Button'

export default function EmergencyModal({ open = true, onClose }) {
  // Enforcing open=true by default for demo purposes as requested
  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-red-950/90 backdrop-blur-md z-50 animate-in fade-in" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border-4 border-red-600 overflow-hidden relative">
            
            {/* Subtle background graphic */}
            <div className="absolute -top-24 -right-24 text-red-100/50 pointer-events-none">
               <AlertTriangle className="w-64 h-64" />
            </div>

            {/* Red header */}
            <div className="bg-red-600 px-8 py-6 text-white text-center relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white text-red-600 mb-4 shadow-lg animate-pulse">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black leading-tight tracking-tight uppercase">EMERGENCY ALERT</h2>
            </div>

            {/* Body */}
            <div className="px-8 py-8 text-center relative z-10">
              <div className="mb-8">
                <p className="text-lg font-bold text-red-600 uppercase tracking-widest mb-2">High-Severity Symptoms Detected</p>
                <p className="text-slate-700 text-lg leading-relaxed">
                  Your condition appears critical. <strong className="text-slate-900 font-black">Seek immediate medical help.</strong>
                </p>
              </div>

              {/* Massive Emergency call button */}
              <a href="tel:112" className="block mb-4">
                <Button variant="danger" size="lg" className="w-full text-xl py-8 rounded-2xl bg-red-600 hover:bg-red-700 shadow-[0_0_30px_rgba(220,38,38,0.4)] animate-pulse border-2 border-red-500">
                  <Phone className="w-7 h-7 mr-3 fill-current" />
                  CALL AMBULANCE IMMEDIATELY
                </Button>
              </a>

              <Button
                variant="ghost"
                className="w-full text-slate-500 hover:text-slate-800"
                onClick={onClose}
              >
                Cancel Alert
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
