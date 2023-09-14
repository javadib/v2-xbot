'use strict';

export default {
  seed: {
    name: 'seed plans',
    cmd: 'select_plan',
    data: [
      {
        model: {
          "id": 1,
          "name": "30 روزه 30 گیگ",
          "totalPrice": 10000,
          "maxDays": 30,
          "volume": 30,
          "maxIp": 1,
          "sharedId": 0,
          "note": "ایاددشت برای ادمین"
        }
      },
      {
        model: {
          "id": 1,
          "name": "60 روزه 60 گیگ",
          "totalPrice": 170000,
          "maxDays": 30,
          "volume": 30,
          "maxIp": 1,
          "sharedId": 0,
          "note": "ایاددشت برای ادمین"
        }
      },
      {
        model: {
          "id": 1,
          "name": "90 روزه 90 گیگ",
          "totalPrice": 250000,
          "maxDays": 90,
          "volume": 90,
          "maxIp": 1,
          "sharedId": 0,
          "note": "ایاددشت برای ادمین"
        }
      },
    ],
  },

  getButtons(nextCmd: string, addBackButton = true) {
    let result: any[] = []
    let data = this.seed.data.map(p => {return {text: p.model.name, callback_data: nextCmd}})
    result.push([data[0]])
    result.push([data[1]])
    // result.push([data.slice(1)]);

    result.push([{text: "برگشت ↩️", callback_data: "select_server"}])

    return result;
  }
}




