
export default function About() {
  return (
    <main>
      <section className="bg-black">
        <div className="max-w-6xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-col sm:align-center">
            <div className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
             🏞 Welcome to HikeUK - A Mapping App for Multi-Day Treks. 🗺️
            </div>

            <div className="mt-8 mb-2 text-xl text-white sm:text-center">
              Features:
            </div>
            <div className="flex items-center justify-center">
                <ul className="list-disc pl-4">
                  <li>🛰 Route with Satellite & OpenStreetMap views.</li>
                  <li>🗺 Create and share multi-day routes with snap-to-route mapping.</li>
                  <li>⛺️ Sleep well with comprehensive coverage of UK campsites, caves, and bothies.</li>
                  <li>🍗 Manage food and water by planning restocks at local supermarkets and pubs.</li>
                </ul>
            </div>

            <div className="mt-8 mb-2 text-xl text-white sm:text-center">
              Development:
            </div>
            <div className="flex items-center justify-center">
              <ul className="list-disc pl-4">
                <li>HikeUK is a React application, written in Typescript, built with Next.js, and hosted on Vercel.</li>
                <li>The core map is provided by OpenLayers and routing is performed via the OpenRouteService API.</li>
                <li>Map features are sourced from OpenStreetMaps and stored in a database hosted on Supabase.</li>
                <li>Users interact via components extending Material ui components, styled with TailwindCSS.</li>
                <li>Supabase integration provides secure user accounts as well as storage for routes, features, and trips.</li>
                <li>All user mapping and accounts functionality is provided via a set of REST API endpoints.</li>
              </ul>
            </div>

            {/* <div className="mt-8 mb-2 text-xl text-white sm:text-center">
              Collaboration and Contribution:
            </div>
            <div className="flex items-center justify-center">
              <div className="pl-4">
              The project is hosted on GitHub here. Anyone is welcome to contribute to the project by improving existing features or adding new functionalities.
              </div>
            </div> */}
          </div>
        </div>
      </section>
    </main>
  );
}
