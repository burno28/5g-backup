import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class SmsService {
  constructor(private readonly config: ConfigService) {}
  //문자 발송을 위한 시그니처 생성 로직
  private makeSignature(): string {
    const message = [];
    console.log(this.config.get('NCP_ACCESSKEY'));
    const hmac = crypto.createHmac('sha256', this.config.get('NCP_ACCESSKEY'));
    console.log(hmac);
    const space = ' ';
    const newLine = '\n';
    const method = 'POST';
    const timestamp = Date.now().toString();
    message.push(method);
    message.push(space);
    message.push(this.config.get('URI'));
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(this.config.get('NCP_ACCESSKEY'));
    //message 배열에 위 내용들을 담아준다.
    const signature = hmac.update(message.join('')).digest('base64');
    //message.join('') 으로 만들어진 string 을 hmac 에 담고, base64로 인코딩한다
    return signature.toString();
  }
  //문자 전송 로직
  async sendSMS(phone: string): Promise<string> {
    const verifyNumber = Math.floor(Math.random() * 100000) + 100000;
    const body = {
      type: 'SMS',
      contentType: 'COMM',
      countryCode: '82',
      from: this.config.get('HOST_PHONE_NUMBER'), // 발신자 번호
      content: `오지는 플리마켓 인증번호 : ${verifyNumber}`,
      messages: [
        {
          to: phone, // 수신자 번호
        },
      ],
    };
    const headerOptions = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-iam-access-key': this.config.get('NCP_ACCESSKEY'),
        'x-ncp-apigw-timestamp': Date.now().toString(),
        'x-ncp-apigw-signature-v2': this.makeSignature(),
      },
    };
    axios
      .post(this.config.get('URL'), body, headerOptions)
      .then(async (res) => {
        // 성공 이벤트
      })
      .catch((err) => {
        console.error(err.response.data);
        throw new InternalServerErrorException();
      });
    return 'success';
  }
}
