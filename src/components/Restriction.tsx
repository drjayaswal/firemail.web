import Image from 'next/image';

const Restriction = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="z-10 flex flex-col items-center max-w-sm w-full text-center">
        <div className="space-y-4">
          <Image
            src="/firemail-opensource.svg"
            alt="Firemail"
            width={240}
            height={80}
            className="mx-auto h-auto w-auto object-contain"
            priority
          />
        </div>

        <div className="w-full p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-xl tracking-tight text-black">Admin Only</h1>
            <p className="text-sm text-muted-foreground">Restricted Route</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Restriction