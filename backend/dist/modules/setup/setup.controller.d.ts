import { SetupService } from './setup.service';
import { SetupStatus } from './dto/setup-status.dto';
export declare class SetupController {
    private readonly setupService;
    constructor(setupService: SetupService);
    getStatus(): Promise<SetupStatus>;
    reset(): Promise<{
        message: string;
    }>;
}
