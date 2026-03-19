-- Function to allow users to cancel their own orders only if status is cancellable
CREATE OR REPLACE FUNCTION public.cancel_user_order(order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_status text;
  order_user_id uuid;
BEGIN
  SELECT order_status, user_id INTO current_status, order_user_id
  FROM public.orders
  WHERE id = order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF order_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF current_status NOT IN ('pending', 'ordered', 'confirmed', 'packed') THEN
    RAISE EXCEPTION 'Order cannot be cancelled after it has been shipped';
  END IF;

  UPDATE public.orders
  SET order_status = 'cancelled', updated_at = now()
  WHERE id = order_id;

  RETURN true;
END;
$$;