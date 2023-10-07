import { buttonVariants } from '@/components/ui/Button';
import { toast } from './use-toast';
import { cn } from '@/lib/utils';

export const useCustomToast = () => {
  const loginToast = () => {
    const { dismiss } = toast({
      title: 'Yêu cầu đăng nhập',
      description: 'Bạn cần đăng nhập để thực hiên được hành động này',
      variant: 'destructive',
      action: (
        <a
          target="_blank"
          className={buttonVariants({ variant: 'outline' })}
          href={'/sign-in'}
          onClick={() => dismiss()}
        >
          Login
        </a>
      ),
    });
  };

  const notFoundToast = () =>
    toast({
      title: 'Không tìm thấy',
      description: 'Không tìm thấy đối tượng. Vui lòng thử lại',
      variant: 'destructive',
    });

  const serverErrorToast = () =>
    toast({
      title: 'Có lỗi xảy ra',
      description: 'Có lỗi xảy ra. Vui lòng thử lại sau',
      variant: 'destructive',
    });

  const successToast = () => toast({ title: 'Thành công' });

  const verifyToast = () => {
    const { dismiss } = toast({
      title: 'Yêu cầu Xác thực',
      description: 'Để thực hiện hành động này bạn cần Xác thực',
      action: (
        <a
          target="_blank"
          href="/verify-request"
          className={cn(buttonVariants(), 'p-2')}
          onClick={() => dismiss()}
        >
          <span className="text-sm w-max">Xác thực</span>
        </a>
      ),
    });
  };

  return {
    loginToast,
    notFoundToast,
    serverErrorToast,
    successToast,
    verifyToast,
  };
};
