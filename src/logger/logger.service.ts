import { Injectable, Logger } from '@nestjs/common';
 
@Injectable()
export class LogService extends Logger {

    logobj(obj: any, context?: string) {
         if(this.isDebug()){
             context ? this.log(JSON.stringify(obj, undefined, 2), context) : this.log(JSON.stringify(obj, undefined, 2))
        }
    }

    logm(msg: string, obj: any,context?:string) {
        if (this.isDebug()) {
            context ? this.log(msg, context) : this.log(msg)
            context ? this.log(JSON.stringify(obj, undefined, 2), context) : this.log(JSON.stringify(obj, undefined, 2))
        }
    }

    isDebug() { 
        return true
    }

}
