import { firstValueFrom, from, retry } from 'rxjs';
import { Task } from "./types/bot_types"

const { API_TOKEN, API_URL } = process.env
const headers = {
  Authorization:
    `bearer ${API_TOKEN}`,
}
export const generateNotificationMessage = (payload:Task) => {
    const task = payload
    const id = task.data.id
    const name = task.data.attributes?.route?.data?.attributes.name
    const date = task.data.attributes.date
    const time = task.data.attributes.departure.data.attributes.time.slice(0,5)
    const count = task.data.attributes.count
    const price = task.data.attributes.route.data.attributes.price
    const amount = count * price
    const client = task.data.attributes.client.data.attributes.name
    const phone = task.data.attributes.client.data.attributes.phone
    const comment = task.data.attributes.comment ?? null
    const markMono = '`'
    return `
        Заказ № *${id}*

        Маршрут: 
            *${name}*

        Дата / время 
            *${date} / ${time}*

        Количество: *${count}*
        Сумма: *${amount}*

        Клиент:
            ${markMono}${client}${markMono}: ${phoneFormat(phone)}
        ${comment &&"Комментарий от клиента:\n `"+comment+"`"}
    `
}
export function phoneFormat(input:string) {
    input = input.replace(/\D/g,'');
    const size = input.length;
    
    if (size<=2) return input

    input=input.slice(-size,-10)+' '+input.slice(-10,-7)+' '+input.slice(-7,-4)+'-'+input.slice(-4,-2)+'-'+input.slice(-2).trim()
    
    if(input.trim()[0] === "-") input=input.trim().slice(1)
    
    if(size === 11) input="+"+input
    
    return input;
}
export async function checkOrderStatus(id:number):Promise<boolean> {
    try {
        const response = await firstValueFrom(from(fetch(`${process.env.API_URL}/api/orders/${id}`, {
            headers:{
                Authorization:`bearer ${process.env.API_TOKEN}`
            }
        })).pipe(
            retry(3) // retry up to 3 times
          ))
        console.log("________________________\n",`${process.env.API_URL}/api/orders/${id}`,response)
        if (!response.ok) throw new Error("Ошибка при загрузке списка заказов.");
        const data = await response.json()
        return data.data.attributes.in_procces;
    } catch (error) {
        console.error(error)
        return false;
    }
}
export async function updateOrderStatus(id:number):Promise<boolean> {
    try {
        const response = await fetch(`${process.env.API_URL}/api/orders/${id}`, {
        method: 'PUT',
        headers:{
            'Content-Type': 'application/json' ,
            Authorization:`bearer ${process.env.API_TOKEN}`
        },
        body:JSON.stringify({
            data: {
                in_procces: true
            }
        })
        });
        console.log("________________________\n",`${process.env.API_URL}/api/orders/${id}`,response)
        if (!response.ok) throw new Error("Ошибка при загрузке списка заказов.");
        const data = await response.json()
        return data.data.attributes.in_procces;
    } catch (error) {
        console.error(error)
        return false;
    }
}