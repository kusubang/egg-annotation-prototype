async function getJobs () {
  return [
    {
      jobId: 'job-0',
      status: 'ready',
      annotations: [],
      json: '',
      img:
        'https://www.greenqueen.com.hk/wp-content/uploads/2022/01/shubham-dhage-qgo7Tt_NWD0-unsplash-scaled.jpg'
    },
    {
      jobId: 'job-1',
      status: 'ready',
      annotations: [],
      json: '',
      img:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5i6Tuhuzo_-x1bIKcD26uaLsCFKdCAiwJhg&usqp=CAU'
    }
  ]
}

export { getJobs }

export default { getJobs }
