import { neon } from "@neondatabase/serverless";

export async function GET(
  request: Request,
  context: { params?: { id?: string } } = {},
) {
  const id = context?.params?.id;

  if (!id) {
    return new Response(
      JSON.stringify({ error: "Missing required id param" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    const rides = await sql`
      SELECT
        rides.id AS ride_id,
        rides.origin_address,
        rides.destination_address,
        rides.pickup_lat AS origin_latitude,
        rides.pickup_lng AS origin_longitude,
        rides.dropoff_lat AS destination_latitude,
        rides.dropoff_lng AS destination_longitude,
        rides.ride_time,
        rides.fare_price,
        rides.payment_status,
        rides.user_id,
        rides.created_at,
        json_build_object(
          'first_name', drivers.first_name,
          'last_name', drivers.last_name,
          'car_seats', drivers.car_seats
        ) AS driver
      FROM rides
      INNER JOIN drivers ON rides.driver_id = drivers.id
      WHERE rides.user_id = ${id}
      ORDER BY rides.created_at DESC;
    `;

    console.log("Fetched rides:", rides);

    return new Response(JSON.stringify(rides), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("Error fetching recent rides:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
