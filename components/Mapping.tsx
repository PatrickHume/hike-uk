import OpenLayersMap from '@/components/ui/OpenLayersMap/OpenLayersMap';
/*
This is the main mapping window which displays the map, route markers, paths, etc.
It also contains all the components needed to create, edit, save, and delete routes.
*/
export default function Mapping() {
  return (
    <section className="bg-black">
      <div className="grow">
        <div className="maplayer" style={{ position: 'static', left: 0, right: 0, zIndex: '1' }}>
          <OpenLayersMap width="100%" height="600px" />
        </div>
      </div>
    </section>
  );
}
