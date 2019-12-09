import { BaseTrigger } from '@midwayjs/runtime-mock';
import { SCFContext } from '@midwayjs/serverless-scf-starter';

export class SCFBaseTrigger extends BaseTrigger {

  useCallback = true;

  createContext(): SCFContext {
    return {
      callbackWaitsForEmptyEventLoop: true,
      memory_limit_in_mb: 128,
      time_limit_in_ms: 3000,
      request_id: '201cb979-17d4-11ea-97b2-5254005dc76e',
      environ:
        'TENCENTCLOUD_SECRETID=AKIDqujysM1OzQdkxCVuz5ziQy--3AbaQjsQJa5MrEtArsktVEpubQOtkHJRR44UzKL_;TENCENTCLOUD_SECRETKEY=wBkxl5PZVggWRVCdw1Eotg1EZQnA52yFbRGfDBrlnNY=;TENCENTCLOUD_SESSIONTOKEN=CLoRnHKfhVo1oMOL4LnWXOJ0ItY8G1Mp9a2f16f204f6ecc866119ff6142f80d9WHZFBiB87BDTGvIWVoeaHs5hU8TPaYZ5WZLGyLmXpWigYfe3NAI2RzxqDAYdiLCyziisLNZi7_ZSFt2bMGpnGAtPuERrY86xRPDUh9NWQ2tGsFPXUfej1uVZvsJuYUjMxU48bCRGCI27IKBI4LmGHi8g_cqUfgh1cYI4btuNHmQ5nF-6JgCMqJNTMewbKPnrB61CfHem92SLKYhdFK9e1E74cHKIS7pE2UxszyYqe6KhHkyGhd0iAOv_wRIsOZ4nuu_w8DdIyT-igO-afD8xeEHr7RRPaqHqMnMK-PXJFb8LGkZ0EvG3_oG1twVlbvZYQw5T22wLsD5ZAe2cWDQvmXCuENQcpA73itflQK2QlRc;SCF_NAMESPACE=default',
      function_version: '$LATEST',
      function_name: 'hellotest',
      namespace: 'default',
    };
  }
}
