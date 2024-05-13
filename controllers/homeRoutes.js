const router = require("express").Router();
const { Post, User } = require("../models");
const withAuthorization = require("../utils/auth");

router.get("/", async (req, res) => {
	try {
		const postData = await Post.findAll({
			include: [
				{
					model: User,
					attributes: ["name"],
				},
			],
		});

		// Serialize requested data so the template may read it
		const posts = postData.map((post) => post.get({ plain: true }));

		// Send the serialized data and the session flag to template
		res.render("homepage", {
			posts,
			logged_in: req.session.logged_in,
		});
	} catch (error) {
		res.status(500).json(error);
	}
});

router.get("/post/:id", async (req, res) => {
	try {
		const postData = await Post.findByPk(req.params.id, {
			include: [
				{
					model: User,
					attributes: ["name"],
				},
			],
		});

		const post = postData.get({ plain: true });

		res.render("post", {
			...post,
			logged_in: req.session.logged_in,
		});
	} catch (error) {
		res.status(500).json(error);
	}
});

router.get("/profile", async (req, res) => {
	try {
		// Find the logged in user based on their session ID
		const userData = await User.findByPk(req.session.userId, {
			attributes: { exclude: ["password"] },
			include: [{ model: Post }],
		});

		if (!req.session.id) {
			res
				.status(400)
				.json({ message: "Sorry, you don't seem to be logged in!" });
			return;
		}

		const user = await userData.get({ plain: true });

		res.render("profile", {
			...user,
			logged_in: true,
		});
	} catch (error) {
		res.status(500).json(error);
	}
});

router.get("/login", (req, res) => {
	if (req.session.logged_in) {
		res.redirect("/profile");
		return;
	}
	res.render("login");
});

module.exports = router;
