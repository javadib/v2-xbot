'use strict';

export default {
  seed: {
    name: 'Seed Payments',
    cmd: 'select_payment',
    prev_cmd: 'select_plan',
    data: [
      {
        model: {
          "id": 1,
          "title": "کارت به کارت",
          "appKey": "علی رضایی",
          "appSecret": "xxxx-xxxx-xxxx-xxxx",
          "url": ""
        }
      }
    ],
  },

  getButtons(nextCmd: string, addBackButton = true) {
    let data = this.seed.data.map(p => {return [{text: p.model.title, callback_data: nextCmd}]})
    data.push([{text: "برگشت ↩️", callback_data: this.seed.prev_cmd}])

    return data;
  }
}




