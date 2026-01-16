-- assigment2.sql file
-- TASK 1 QUERIES

-- 5.1: Insert Tony Stark record
INSERT INTO public.account (
    account_firstname,
    account_lastname,
    account_email,
    account_password
) VALUES (
    'Tony',
    'Stark',
    'tony@starkent.com',
    'Iam1ronM@n'
);

-- 5.2: Update Tony Stark account_type to 'Admin'
UPDATE public.account 
SET account_type = 'Admin'::account_type
WHERE account_firstname = 'Tony' 
AND account_lastname = 'Stark';

-- 5.3: Delete Tony Stark record
DELETE FROM public.account
WHERE account_firstname = 'Tony' 
AND account_lastname = 'Stark';

-- 5.4: Update GM Hummer description
UPDATE public.inventory
SET inv_description = REPLACE(
    inv_description,
    'small interiors',
    'a huge interior'
)
WHERE inv_make = 'GM' 
AND inv_model = 'Hummer';

-- 5.5: Inner join for Sport category vehicles
SELECT 
    inv.inv_make,
    inv.inv_model,
    cl.classification_name
FROM public.inventory inv
INNER JOIN public.classification cl
    ON inv.classification_id = cl.classification_id
WHERE cl.classification_name = 'Sport';

-- 5.6: Update image paths to include '/vehicles'
UPDATE public.inventory
SET 
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');