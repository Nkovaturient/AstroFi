import { faTags } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function MissionCard({ mission }) {
  return (
    <div className="card bg-white border border-green-500 mb-6 mt-4 rounded-lg shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-1">
          <img
            className="w-full h-auto rounded-l-lg object-cover"
            src={mission.ImgUrl ? mission.ImgUrl : "/a1-cool.jpg"}
            alt="blog img"
          />
        </div>
        <div className="col-span-3">
          <div className="card-header bg-emerald-600 text-white p-4">
            <h5 className="text-lg font-bold">
              {mission.title}
              <span
                className={`ml-4 px-3 py-1 rounded-full text-sm font-medium `}
              >
                {mission.walletAddress}
              </span>
            </h5>
          </div>

          <div className="card-body p-4 space-y-4">
            {mission.tags && mission.tags?.length > 0 && (
              <div className="tags flex items-center space-x-2 mt-3">
                <FontAwesomeIcon icon={faTags} className="text-gray-500" />
                <div className="flex flex-wrap gap-2">
                  {mission.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-sm font-medium shadow-sm hover:bg-gray-300 transition ease-in-out duration-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-gray-600">{mission.description}</p>
            <p className="text-sm text-gray-500 mt-4">
              <small>{mission.createdAt?.split("T")[0]}</small>
            </p>
          </div>

          <div className="card-footer bg-transparent border-t border-green-500 p-4 text-gray-700">
            {mission.creator || "@Unknown"}
          </div>
        </div>
      </div>
    </div>
  );
}
