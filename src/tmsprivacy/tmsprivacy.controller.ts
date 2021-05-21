import { Body, Controller, Get, Header, Post, Res } from '@nestjs/common';
import { TiCodes, Message } from 'src/flow/flow.model';
import { privacyhtml, privacyhtml_2, termshtml, termshtml_2 } from './terms.constant';

@Controller('tmsprivacy')
export class TmsprivacyController {
    constructor() { }

    @Get('terms')
    @Header('content-type', 'text/html')
    async getTms(@Body() task, @Res() res) {
        return res.send(termshtml + termshtml_2)
    }

    @Get('policy')
    @Header('content-type', 'text/html')
    async getPolicy(@Body() task, @Res() res) {
        return res.send(privacyhtml + privacyhtml_2)
    }
}
