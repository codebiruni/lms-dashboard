import React from 'react'
import CreateCertificateTemplate from './CreateCertificateTemplate'
import CreateCertificateMobile from './CreateCertificateMobile'

export default function page() {
  return (
    <div className='py-6'>
      <CreateCertificateTemplate />
      <CreateCertificateMobile />
    </div>
  )
}
