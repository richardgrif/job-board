import prisma from 'lib/prisma'
import Jobs from 'components/Jobs'
import Link from 'next/link'
import { getJobs, getUser } from 'lib/data'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function Home({ jobs, user }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const loading = status === 'loading'

  if (loading) return null

  if (!loading && session && !session.user.name) {
    router.push('/setup')
  }
  
  return (
    <div className='mt-10'>
      {!session ? (
        <Link href='/api/auth/signin' className='border px-8 py-2 mt-5 font-bold rounded-full bg-black text-white border-black'>Login</Link>
      ) : (
        <Link href='/api/auth/signout' className='border px-8 py-2 mt-5 font-bold rounded-full bg-black text-white border-black'>Logout</Link> 
      )}
      <div className='text-center p-4 m-4'>
        <h2 className='mb-10 text-4xl font-bold'>Find a job!</h2>
      </div>      

      {/* User Session code starts below */}
      { session && (
        <>
          <p className='mb-10 text-2xl font-normal'>
            Welcome, {session.user.name} {user.company && ( <span className='bg-black text-white uppercase text-sm p-2'> Company </span> )}
          </p>
          {user.company ? (
            <>
              <Link href={`/new`}>
                <button className='border px-8 py-2 mt-5 font-bold rounded-full bg-black text-white border-black '>click here to post a new job</button>
              </Link>
              <Link href={`/dashboard`} >
                <button className='ml-5 border px-8 py-2 mt-5 font-bold rounded-full bg-black text-white border-black '>see all the jobs you posted</button>
              </Link>
            </>
          ) : (
            <>
            <Link href={`/dashboard`} >
              <button className='ml-5 border px-8 py-2 mt-5 font-bold rounded-full bg-black text-white border-black '>
                see all the jobs you applied to
              </button>
            </Link>
            </>
          )}
        </>
      )}
      {/*User session code ends here */}

      
      <Jobs jobs={jobs} />
    </div>
  )
}

export async function getServerSideProps(context) {
  const session = await getSession(context)

  let jobs = await getJobs(prisma)
  jobs = JSON.parse(JSON.stringify(jobs))

  if (!session) {
    return {
      props: { jobs }
    }
  }

  let user = await getUser(session.user.id, session.user.email, prisma)
  user = JSON.parse(JSON.stringify(user))

  return {
    props: {
      jobs, user,
    }
  }
}