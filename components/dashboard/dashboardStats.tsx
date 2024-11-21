// DashboardStats.tsx

interface StatItem {
  label: string;
  value: number;
}

interface DashboardStatsProps {
  header: string;
  description: string;
  stats: StatItem[];
}

const DashboardStats = ({
  header,
  description,
  stats,
}: DashboardStatsProps) => {
  
  return (
    <>
      <div className="flex justify-center w-full py-12">
        <div className="text-center">
          <h1 className="text-4xl font-semibold">{header}</h1>
          <p className="pt-5 text-gray-600">{description}</p>
        </div>
      </div>
      <div className="w-full flex justify-center ">
      {/* <div className={`grid gap-4 md:grid-cols-2  ${stats?.length > 2 ?"lg:grid-cols-3 w-full" : "lg:grid-cols-2  w-full"}`}> */}
      <div className={`grid gap-4 md:grid-cols-2  ${stats?.length > 2 ?"lg:grid-cols-3 w-[80%]" : "lg:grid-cols-2 w-1/2"}`}>
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-xl border text-center bg-card text-card-foreground shadow"
          >
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">
                {stat.label}
              </h3>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </>
  );
};

export default DashboardStats;
