import { Body, Injectable, Post } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../global/entities/users.entity';
import { Repository } from 'typeorm';
// GoogleUser type
interface GoogleUser {
  id: string;
  nickname: string;
  email: string;
  name: string;
}
//strategy에서 return되는 값
// email: emails[0].value,
// firstName: name.familyName,
// lastName: name.givenName,
// //패스워드는 36진수의 랜덤숫자로 생성되어 저장할 예정
// passWord: Math.random().toString(36).substring(2, 12),
// // picture: photos[0].value,
// accessToken,
interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  passWord: string;
  accessToken: string;
}

//TODO: req.user로 리턴되는 정보 가입처리
//─────────OAuth Google─────────
//TODO: 유저 데이터 집어넣어 가입시키기
//TODO: 리팩토링 기간에 메소드 전면 수정해야함
//TODO: 이메일이 중복되는지 확인해야함
// register 메소드를 재사용 해야한다. 아님 코드가 드러워졍...

@Injectable()
export class SocialService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}
  async googleLogin(req) {
    console.log('이메일이 될 친구', req.user.email);
    console.log('닉네임이 될 친구', req.user.nickName);
    console.log('비밀번호가 될 친구', req.user.passWord);
    console.log('엑세스토큰이 될 친구', req.user.accessToken);
    console.log('토큰이 될 친구', req.user.refreshToken);
    const newUser = new UserEntity();
    newUser.email = req.user.email;
    newUser.nickname = req.user.nickName;
    newUser.password = req.user.passWord;
    newUser.phone = '010-0000-0000';
    newUser.address = '주소를 수정해주세요';
    // this.userRepository
    //   .findOne(req.user.email)
    //   .then((result) => {
    //     console.log(result);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
    //오늘의 TIL감 Promise <pending> 으로 나온다? -> async await을 안붙였다 .. 댕청쓰
    const userFound = await this.userRepository.findOne({
      where: { email: req.user.email },
    });
    if (userFound) {
      throw Error(
        //TODO: # 추후 로직을 로그인을 시키는 방향으로 수정할 것
        '이미 가입된 이메일입니다. ',
      );
    }

    this.authService
      .register(newUser)
      .then((result) => console.log(result))
      .catch((err) => {
        console.log(err);
      });
    //이 함수 내에서 회원가입을 처리해야하는데.. 음..
    //여기서 회원가입을 처리하려면... 어떻게 해야할까?
    //필수 요소는 다 되었으니, 가입하면 된다.
    //이제 이 일은 auth.service.ts에서 처리해야한다.
    //이메일이 중복되는지 확인해야함
    //이메일이 중복되면, 로그인을 시켜버리고
    //이메일이 중복되지 않으면, 가입처리를 해야함
    if (!req.user) {
      return '정상적인 경로로 가입된 유저가 아닙니다. 서비스 관리자에게 문의해주세요.';
    }
    return {
      message: 'User information from google',
      user: req.user,
    };
  }
}
