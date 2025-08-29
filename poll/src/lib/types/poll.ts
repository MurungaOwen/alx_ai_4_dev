export interface PollOption {
  id: string
  text: string
  votes: number
}

export interface Poll {
  id: string
  title: string
  description?: string
  options: PollOption[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
  active: boolean
  allowMultiple: boolean
  anonymous: boolean
  totalVotes: number
}

export interface CreatePollInput {
  title: string
  description?: string
  options: string[]
  allowMultiple?: boolean
  anonymous?: boolean
}

export interface Vote {
  id: string
  pollId: string
  optionId: string
  userId?: string
  createdAt: Date
}