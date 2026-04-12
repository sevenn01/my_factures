// 'use client'

// import { useEffect } from 'react'
// import { supabase } from '../../lib/supabaseClient'

// export default function TestSignupPage() {
//   useEffect(() => {
//     async function testSignup() {
//       const { data, error } = await supabase.auth.signUp({
//         email: 'newuser123@test.com',
//         password: 'Password123!',
//       })
//       if (error) console.error('Signup error:', error)
//       else console.log('Signup success:', data)
//     }

//     testSignup()
//   }, [])

//   return <div>Check console for signup result</div>
// }