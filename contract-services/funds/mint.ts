import { getMintBalance } from '../../analytics/analitics';

const mintTokenOnCrowdedEvent = async (id: number) => {
    let balance = await getMintBalance(String(id))
}

export {
    mintTokenOnCrowdedEvent
}