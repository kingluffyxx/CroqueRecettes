 
 export default function PreviewSection() {
   return (
        <div className="bg-base-200 py-20">
        <div className="mx-auto px-4 container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl md:text-4xl">
              Interface Simple et Intuitive
            </h2>
            <p className="text-xl">
              Concentrez-vous sur vos recettes grâce à notre design épuré et sans distractions.
            </p>
          </div>
          <div className="justify-center items-center gap-8 grid md:grid-cols-3 mx-auto max-w-6xl">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop" alt="Nourriture 1"
              className="shadow-xl rounded-lg hover:scale-105 transition-all duration-500 transform"
            />
            <img
              src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400&h=300&fit=crop"
              alt="Nourriture 2"
              className="shadow-xl rounded-lg hover:scale-105 transition-all duration-500 transform"
            />
            <img
              src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop"
              alt="Nourriture 3"
              className="shadow-xl rounded-lg hover:scale-105 transition-all duration-500 transform"
            />
          </div>
        </div>
      </div>
   );
 }
