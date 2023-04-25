import { TestBed } from '@angular/core/testing';

import {PlatinumApiService, TokenExpiredError, TokenInValidError} from './platinum-api.service';

describe('PlatinumApiService', () => {
  let service: PlatinumApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlatinumApiService);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('when token expired then token is invalid', () => {
    spyOn(service, 'getIsTokenExpired').and.returnValue(true);
    let isTokenValid= service.isTokenValid();
    expect(isTokenValid).toBe(false);
  });

  it('when token empty then token is invalid', () => {
    spyOn(service, 'getToken').and.returnValue('');
    let isTokenValid= service.isTokenValid();
    expect(isTokenValid).toBe(false);
  });

  it('when token is expired then token is invalid', () => {

    let service: PlatinumApiService;
    service = TestBed.inject(PlatinumApiService);

    spyOn(service, 'getToken').and.returnValue('have some thing');
    spyOn(service, 'getIsTokenExpired').and.returnValue(true);

    let isTokenValid= service.isTokenValid();
    expect(isTokenValid).toBe(false);
  });

  it('when token is not expired and has value then token is valid', () => {

    spyOn(service, 'getToken').and.returnValue('have some thing');
    spyOn(service, 'getIsTokenExpired').and.returnValue(false);

    let isTokenValid= service.isTokenValid();
    expect(isTokenValid).toBe(true);
  });

  it('when platinum api throw invalid error', async () => {

    let service: PlatinumApiService;
    service = TestBed.inject(PlatinumApiService);

    let sendApiToPlatinumSpy = spyOn(service, 'sendApiToPlatinum').and.returnValue(
      new Promise((resolve)=>{ throw new TokenInValidError()})
    );

    await expectAsync(service.sendApi()).toBeRejectedWith(new TokenInValidError());
    expect(sendApiToPlatinumSpy).toHaveBeenCalledTimes(1);

  });

  it('when platinum api success', async () => {

    let service: PlatinumApiService;
    service = TestBed.inject(PlatinumApiService);

    let successRes = "GOOD you are best";
    let sendApiToPlatinumSpy = spyOn(service, 'sendApiToPlatinum').and.returnValue(
      new Promise((resolve)=>{ return resolve(successRes) })
    );

    let res = await service.sendApi();
    expect(res).toBe(successRes);

    expect(sendApiToPlatinumSpy).toHaveBeenCalledTimes(1);

  });

  it('when platinum token expired then sendApiToPlatinum will call two time', async () => {

    let service: PlatinumApiService;
    service = TestBed.inject(PlatinumApiService);
    service.setIsTokenExpired(true);
    let sendApiToPlatinumSpy = spyOn(service, 'sendApiToPlatinum').and.returnValue(
      new Promise((resolve)=>{throw new TokenExpiredError()})
    );

    await expectAsync(service.sendApi()).toBeRejectedWith(new TokenExpiredError());
    expect(sendApiToPlatinumSpy).toHaveBeenCalledTimes(2);

  });

  it('when platinum token invalid then sendApiToPlatinum will run resetTokenFromAPI()', async () => {

    let service: PlatinumApiService;
    service = TestBed.inject(PlatinumApiService);
    service.setIsTokenExpired(true);
    spyOn(service, 'isTokenValid').and.returnValues(false, true);
    let resetTokenFromAPISpy = spyOn(service, 'resetTokenFromAPI');

    let res = await service.sendApiToPlatinum();
    expect(resetTokenFromAPISpy).toHaveBeenCalledTimes(1);
    expect(res).toBeInstanceOf(String);

  });


});
