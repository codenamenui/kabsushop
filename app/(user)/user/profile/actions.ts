export const createProfile = async (profileData: {
    studNumber: string;
    fname: string;
    mname: string;
    lname: string;
    college: string;
    selectedProgram: string;
    studYear: string;
}) => {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/profile/create-profile`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(profileData),
            cache: "no-store",
        }
    );
    const data = await res.json();
    const status = res.status;
    return { data, status };
};
