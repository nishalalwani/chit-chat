import { Stack,Skeleton } from '@mui/material'
import React from 'react'

const ChatLoading = () => {
  return (
    <div>
        <Stack>
            <Skeleton variant="rectangular" width={210} height={118} animation ="wave" />
            <Skeleton variant="rectangular" width={210} height={118} animation ="wave" />
            <Skeleton variant="rectangular" width={210} height={118} animation ="wave" />
            <Skeleton variant="rectangular" width={210} height={118} animation ="wave" />
            <Skeleton variant="rectangular" width={210} height={118} animation ="wave" />
          
        </Stack>
    </div>
  )
}

export default ChatLoading