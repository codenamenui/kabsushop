"use client";

import React, { useState, ChangeEvent, useEffect } from "react";
import ProfileInputComponent from "@/components/ProfileInputComponent";
import { createProfile } from "./actions";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type College = {
    id: number;
    name: string;
};

type Program = {
    id: number;
    name: string;
    college_id: number;
};

type Profile = {
    id: number;
    first_name: string;
    last_name: string;
    student_number: string;
    contact_number: string;
    college_id: number;
    program_id: number;
    year: number;
    section: number;
};

const NewProfile = () => {
    const [studNumber, setStudNumber] = useState("");
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [selectedCollege, setSelectedCollege] = useState<number>(-1);
    const [selectedProgram, setSelectedProgram] = useState<string>("");
    const [colleges, setColleges] = useState(null);
    const [programs, setPrograms] = useState(null);
    const [year, setYear] = useState<string>("");
    const [filteredPrograms, setFilteredPrograms] = useState<Program[]>(null);
    const [contact, setContact] = useState("");
    const [section, setSection] = useState("");
    const [profileExist, setProfileExist] = useState(false);

    useEffect(() => {
        const getInitialProfile = async () => {
            const supabase = createClientComponentClient();
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) {
                console.error(userError);
                return;
            }

            let { data: profile, error: profileErrors } = await supabase
                .from("profiles")
                .select(
                    "id, first_name, last_name, student_number, contact_number, college_id, program_id, year, section"
                )
                .eq("id", user.id)
                .single();

            if (profile != null) {
                setStudNumber(profile.student_number);
                setFname(profile.first_name);
                setLname(profile.last_name);
                setSelectedCollege(profile.college_id);
                setSelectedProgram(profile.program_id);
                setYear(profile.year);
                setContact(profile.contact_number);
                setSection(profile.section);
                setProfileExist(true);
            }

            let { data: colleges, error: colErrors } = await supabase
                .from("colleges")
                .select();

            if (colErrors) {
                console.error(colErrors);
                return;
            }

            let { data: programs, error: progErrors } = await supabase
                .from("programs")
                .select();

            if (progErrors) {
                console.error(progErrors);
                return;
            }

            setColleges(colleges);
            setPrograms(programs);

            console.log(programs);
            setFilteredPrograms(
                programs.filter(
                    (program) => program.college_id == profile.college_id
                )
            );
        };
        getInitialProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const supabase = createClientComponentClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
            console.error(authError);
            return;
        }
        console.log(selectedProgram);
        if (profileExist) {
            const { error: databaseError } = await supabase
                .from("profiles")
                .update([
                    {
                        first_name: fname,
                        last_name: lname,
                        student_number: studNumber,
                        contact_number: contact,
                        college_id: selectedCollege,
                        program_id: selectedProgram,
                        year: year,
                        section: section,
                        email: user.email,
                    },
                ])
                .eq("id", user?.id);
            if (databaseError) {
                console.error(databaseError);
                return;
            }
        } else {
            const { error: databaseError } = await supabase
                .from("profiles")
                .insert([
                    {
                        id: user.id,
                        first_name: fname,
                        last_name: lname,
                        student_number: studNumber,
                        contact_number: contact,
                        college_id: selectedCollege,
                        program_id: selectedProgram,
                        year: year,
                        section: section,
                        email: user.email,
                    },
                ]);
            if (databaseError) {
                console.error(databaseError);
                return;
            }
        }
    };

    const handleCollegeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const collegeId = parseInt(event.target.value);
        setSelectedCollege(collegeId);
        setSelectedProgram(""); // Reset the program when the college changes
        setFilteredPrograms(
            programs?.filter((program) => program.college_id == collegeId)
        );
    };

    const handleProgramChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedProgram(event.target.value);
    };

    const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setYear(event.target.value);
    };

    return (
        <div>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col justify-center items-center h-screen w-screen"
            >
                <div className="flex flex-col justify-center bg-[#ededed] border border-gray-300 rounded-lg shadow-lg p-4 w-3/12">
                    <h1 className="title text-center bg-black">
                        Profile Information
                    </h1>

                    <ProfileInputComponent
                        label="Student Number"
                        type="text"
                        name="stud_number"
                        id="stud_number"
                        value={studNumber}
                        placeholder="Enter student number..."
                        onChange={(e) => setStudNumber(e.target.value)}
                    />

                    <ProfileInputComponent
                        label="First Name"
                        type="text"
                        name="fname"
                        id="fname"
                        value={fname}
                        placeholder="Enter first name..."
                        onChange={(e) => setFname(e.target.value)}
                    />

                    <ProfileInputComponent
                        label="Last Name"
                        type="text"
                        name="lname"
                        id="lname"
                        value={lname}
                        placeholder="Enter last name..."
                        onChange={(e) => setLname(e.target.value)}
                    />

                    <ProfileInputComponent
                        label="Contact Number"
                        type="text"
                        name="contact"
                        id="contact"
                        value={contact}
                        placeholder="Enter contact number..."
                        onChange={(e) => setContact(e.target.value)}
                    />

                    <label htmlFor="college">College: </label>
                    <select
                        name="college"
                        id="college"
                        value={selectedCollege}
                        onChange={handleCollegeChange}
                        className="dropdown"
                        required
                    >
                        <option value=""></option>
                        {colleges &&
                            colleges.map((college) => (
                                <option key={college.id} value={college.id}>
                                    {college.name}
                                </option>
                            ))}
                    </select>

                    <label htmlFor="program">Program: </label>
                    <select
                        id="program"
                        name="program"
                        value={selectedProgram}
                        onChange={handleProgramChange}
                        className="dropdown"
                        required
                    >
                        <option value=""></option>
                        {filteredPrograms &&
                            filteredPrograms.map((program) => (
                                <option key={program.id} value={program.id}>
                                    {program.name}
                                </option>
                            ))}
                    </select>

                    <ProfileInputComponent
                        label="Year"
                        type="text"
                        name="year"
                        id="year"
                        value={year}
                        placeholder="Enter year..."
                        onChange={(e) => setYear(e.target.value)}
                    />

                    <ProfileInputComponent
                        label="Section"
                        type="text"
                        name="section"
                        id="section"
                        value={section}
                        placeholder="Enter last name..."
                        onChange={(e) => setSection(e.target.value)}
                    />

                    <button type="submit" className="bg-black">
                        {submitting ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewProfile;
