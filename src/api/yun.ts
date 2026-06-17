import request from '@/utils/request'

export default {
    getLLGold() {
        return request({
            url: '/miniapp/goldAll',
            method: 'get',
        })
    },
    getQuotes() {
        return request({
            url: '/miniapp/quotes',
            method: 'get',
        })
    },
    getPassion() {
        return request({
            url: '/miniapp/passion',
            method: 'get',
        })
    },
}