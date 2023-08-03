import { kv } from '@vercel/kv'
/*
Displays the current number of page views using vercel keyvalue storage.
Issue: Counter appears to increment twice on page view.
*/
export default async function ViewCounter() {
  // retrieve and increment the number of views from the database
  const views = await kv.incr('views')
  // display views
  return (
    <p className="text-sm text-gray-500">
      {Intl.NumberFormat('en-us').format(views)} views
    </p>
  )
}
